DELIMITER $$
    create procedure p_GetPollResults(
        IN p_poll_id VARCHAR(36)
    )

    BEGIN
        select a.answer_name, COUNT(ua.answer_id) `votes`
        from poll_answers a
        left join poll_users_answers ua on ua.answer_id = a.id
        where a.poll_id = p_poll_id
        group by a.id;

    END $$
DELIMITER ;