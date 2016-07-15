DELIMITER $$
    create procedure p_GetPollWithAnswers(
        IN p_poll_id VARCHAR(36)
    )

    BEGIN

        call p_GetPoll(p_poll_id);
        call p_GetPollAnswers(p_poll_id);

    END $$
DELIMITER ;