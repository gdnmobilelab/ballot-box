DELIMITER $$
    create procedure p_CastVote(
        IN p_poll_id VARCHAR(36),
        IN p_answer_id VARCHAR(36),
        IN p_user_id VARCHAR(255),
        IN p_user_subscription JSON
    )

    BEGIN
        declare v_user_exists BIGINT;
        declare v_user_id BIGINT;
        declare v_poll_closed BOOLEAN;

        DECLARE EXIT HANDLER FOR SQLSTATE '23000' BEGIN
            call p_GetPoll(p_poll_id); -- Return the poll
            call p_GetPollResults(p_poll_id); -- Return the results
            call p_GetPollResponse(p_poll_id, 'POLL_COMPLETED');
            call p_GetPollResponse(p_poll_id, 'POLL_UPDATE');
            call p_GetPollThresholds(p_poll_id);
        END;


        select id from users where user_id = p_user_id into v_user_exists;

        IF v_user_exists IS NULL THEN
            call p_CreateUser(p_user_id, p_user_subscription, @user_id);
            select @user_id into v_user_id;
        ELSE
            select v_user_exists into v_user_id;
        END IF;

        select is_closed from polls where id = p_poll_id into v_poll_closed;

        IF v_poll_closed IS NOT TRUE THEN
            insert into poll_users_answers(user_id, answer_id, poll_id) values (v_user_id, p_answer_id, p_poll_id);
        END IF;

        -- Failure to insert above prevents below

       call p_GetPoll(p_poll_id); -- Return the poll
       call p_GetPollResults(p_poll_id); -- Return the results
       call p_GetPollResponse(p_poll_id, 'POLL_COMPLETED');
       call p_GetPollResponse(p_poll_id, 'POLL_UPDATE');
       call p_GetPollThresholds(p_poll_id);

    END $$
DELIMITER ;