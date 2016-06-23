create database ballotbox;

use ballotbox;

create table if not exists polls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    poll_title VARCHAR(350),
    poll_question VARCHAR(1000),
    poll_is_closed BOOLEAN,
    poll_sns_topic VARCHAR(500),
    poll_taken_response JSON,
    poll_not_taken_response JSON,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now()
);

create table if not exists poll_thresholds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    threshold INT,
    poll_id BIGINT,
    threshold_locked_on TIMESTAMP NULL,
    created_on TIMESTAMP DEFAULT now(),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id)
);

create table if not exists answers (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    answer_name VARCHAR(350),
    poll_id BIGINT,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id)
);

create table if not exists users (
	id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    user_subscription JSON,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now()
);

create table if not exists users_answers (
    user_id BIGINT,
    answer_id BIGINT,
    poll_id BIGINT,
    created_on TIMESTAMP DEFAULT now(),
    modified_on TIMESTAMP DEFAULT now() ON UPDATE now(),
    FOREIGN KEY FK_user_id (user_id) REFERENCES users(id),
    FOREIGN KEY FK_answer_id (answer_id) REFERENCES answers(id),
    FOREIGN KEY FK_poll_id (poll_id) REFERENCES polls(id),
    PRIMARY KEY (user_id, poll_id)
);