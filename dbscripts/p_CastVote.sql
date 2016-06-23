DELIMITER $$
    create procedure p_CastVote(
        IN p_poll_id BIGINT,
        IN p_user_id VARCHAR(255),
        IN p_user_subscription JSON,
        IN p_answer_id BIGINT
    )

    BEGIN
        declare v_user_exists BIGINT;
        declare v_user_id BIGINT;
        declare v_poll_total BIGINT;
        declare v_poll_threshold BIGINT DEFAULT NULL;
        declare v_poll_threshold_id BIGINT DEFAULT NULL;

        select id from users where user_id = p_user_id into v_user_exists;

        IF v_user_exists IS NULL THEN
            call p_CreateUser(NULL, p_user_id, p_user_subscription, @user_id);
            select @user_id into v_user_id;
        ELSE
            select v_user_exists into v_user_id;
        END IF;

        -- insert the user's answer
        insert into users_answers(user_id, answer_id, poll_id) values (v_user_id, p_answer_id, p_poll_id);

        -- Failure to insert above prevents below

       call p_GetPollWithResults(p_poll_id);
       call p_GetPollThresholds(p_poll_id);

    END $$
DELIMITER ;