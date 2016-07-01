DELIMITER $$
    create procedure p_CreateUser(
        IN p_user_id VARCHAR(255),
        IN p_user_subscription JSON,
        OUT out_user_id BIGINT
    )

    BEGIN

        insert into poll_users(user_id, user_subscription) values (p_user_id, p_user_subscription);

        SET out_user_id = LAST_INSERT_ID();

    END $$
DELIMITER ;