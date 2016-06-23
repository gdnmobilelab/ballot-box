DELIMITER $$
    create procedure p_GetPollWithResults(
        IN p_poll_id BIGINT
    )

    BEGIN

       call p_GetPollResults(p_poll_id);
       call p_GetPoll(p_poll_id);

    END $$
DELIMITER ;