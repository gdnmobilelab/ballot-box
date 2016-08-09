create database if not exists ballotboxv2;

use ballotboxv2;

create table if not exists users (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    user_subscription JSON,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now()
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- - POLL RELATED ---

create table if not exists polls (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500),
    question VARCHAR(1000),
    icon VARCHAR(2500),
    is_closed BOOLEAN,
    tag VARCHAR(300),
    sns_topic VARCHAR(500),
    next_question_text VARCHAR(500),
    next_question_icon VARCHAR(2500),
    on_tap JSON,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now()
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists poll_thresholds (
    threshold INT,
    poll_id VARCHAR(36),
    threshold_locked_on TIMESTAMP NULL,
    created_on TIMESTAMP DEFAULT now(),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id),
    PRIMARY KEY (threshold, poll_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists poll_answers (
	id VARCHAR(36) PRIMARY KEY,
    answer_name VARCHAR(350),
    poll_id VARCHAR(36),
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists poll_users_answers (
    user_id BIGINT,
    answer_id VARCHAR(36),
    poll_id VARCHAR(36),
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_user_id (user_id) REFERENCES users(id),
    FOREIGN KEY FK_answer_id (answer_id) REFERENCES poll_answers(id),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id),
    PRIMARY KEY (user_id, poll_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -- Notification Related -----

create table if not exists poll_notification_response_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT into poll_notification_response_types(id, type) VALUES
(1, 'POLL_COMPLETED'),
(2, 'POLL_SKIPPED'),
(3, 'POLL_UPDATE');

create table if not exists poll_notification_responses (
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
    FOREIGN KEY FK_response_type (response_type) REFERENCES poll_notification_response_types(id),
    PRIMARY KEY (id, response_type, poll_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------- END POLL RELATED FUNCTIONALITY ----------

-- - QUIZ RELATED ---

create table if not exists quizzes (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500),
    description VARCHAR(1000),
    icon VARCHAR(2500),
    is_closed BOOLEAN,
    tag VARCHAR(300),
    sns_topic VARCHAR(500),
    on_tap JSON,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now()
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists quiz_questions (
	id VARCHAR(36) PRIMARY KEY,
    question VARCHAR(1500),
    quiz_id VARCHAR(36),
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_quiz_id (quiz_id) REFERENCES quizzes(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists quiz_answers (
	id VARCHAR(36) PRIMARY KEY,
    answer_name VARCHAR(350),
    quiz_question_id VARCHAR(36),
    answer_text VARCHAR(1000),
    correct_answer BOOLEAN,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_quiz_question_id (quiz_question_id) REFERENCES quiz_questions(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists quiz_users_answers (
    user_id BIGINT,
    answer_id VARCHAR(36) NOT NULL,
    quiz_question_id VARCHAR(36) NOT NULL,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_quiz_answer_id (answer_id) REFERENCES quiz_answers(id),
    FOREIGN KEY FK_user_id (user_id) REFERENCES users(id),
    FOREIGN KEY FK_quiz_question_id (quiz_question_id) REFERENCES quiz_questions(id),
    PRIMARY KEY (user_id, quiz_question_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

create table if not exists quiz_notification_response_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT into quiz_notification_response_types(id, type) VALUES
(1, 'QUIZ_COMPLETED'),
(2, 'QUIZ_SKIPPED'),
(3, 'QUIZ_UPDATE');

create table if not exists quiz_notification_responses (
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
    quiz_id VARCHAR(36),
    FOREIGN KEY FK_quiz_id (quiz_id) REFERENCES quizzes(id),
    FOREIGN KEY FK_response_type (response_type) REFERENCES poll_notification_response_types(id),
    PRIMARY KEY (id, response_type, quiz_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------