DELIMITER $$
    create procedure p_CreateUser(
        IN p_id BIGINT,
        IN p_user_id VARCHAR(255),
        IN p_user_subscription JSON,
        OUT out_user_id BIGINT
    )

    BEGIN

        IF p_id IS NOT NULL
        THEN
            update users
            set
                user_id = p_user_id,
                user_subscription = p_user_subscription
            where id = p_id;

            SET out_user_id = p_id;
        ELSE
            insert into users(user_id, user_subscription) values (p_user_id, p_user_subscription);

            SET out_user_id = LAST_INSERT_ID();
        END IF;

    END $$
DELIMITER ;