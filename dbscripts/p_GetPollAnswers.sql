DELIMITER $$
    create procedure p_GetPollAnswers(
        IN p_poll_id VARCHAR(36)
    )

    BEGIN

        select a.id, a.answer_name from poll_answers a
        where a.poll_id = p_poll_id;

    END $$
DELIMITER ;