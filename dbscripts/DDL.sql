create database ballotbox;

use ballotbox;

-- - POLL RELATED ---

create table if not exists polls (
    id VARCHAR(36) PRIMARY KEY,
    question VARCHAR(1000),
    icon VARCHAR(2500),
    is_closed BOOLEAN,
    tag VARCHAR(300),
    sns_topic VARCHAR(500),
    next_question_text VARCHAR(500),
    next_question_icon VARCHAR(2500),
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now()
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists poll_thresholds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    threshold INT,
    poll_id VARCHAR(36),
    threshold_locked_on TIMESTAMP NULL,
    created_on TIMESTAMP DEFAULT now(),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists poll_answers (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    answer_name VARCHAR(350),
    poll_id VARCHAR(36),
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists poll_users (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    user_subscription JSON,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now()
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists poll_users_answers (
    user_id BIGINT,
    answer_id BIGINT,
    poll_id VARCHAR(36),
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_user_id (user_id) REFERENCES poll_users(id),
    FOREIGN KEY FK_answer_id (answer_id) REFERENCES poll_answers(id),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id),
    PRIMARY KEY (user_id, poll_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -- Notification Related -----

create table if not exists notification_response_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT into notification_response_types(id, type) VALUES
(1, 'POLL_COMPLETED'),
(2, 'POLL_SKIPPED'),
(3, 'POLL_UPDATE');

create table if not exists notification_responses (
    id VARCHAR(36),
    response_title VARCHAR(350),
    response_body VARCHAR(1000),
    response_on_tap JSON,
    response_on_close JSON,
    response_action_button_one_commands JSON,
    response_action_button_one_text VARCHAR(100),
    response_action_button_one_icon VARCHAR(250),
    response_action_button_two_commands JSON,
    response_action_button_two_text VARCHAR(100),
    response_action_button_two_icon VARCHAR(250),
    response_type BIGINT,
    poll_id VARCHAR(36),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id),
    FOREIGN KEY FK_response_type (response_type) REFERENCES notification_response_types(id),
    PRIMARY KEY (id, response_type, poll_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------