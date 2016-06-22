DELIMITER $$
    create procedure p_GetPollResults(
        IN p_poll_id BIGINT
    )

    BEGIN
        select a.answer_name, COUNT(ua.answer_id) `votes`
        from answers a
        left join users_answers ua on ua.answer_id = a.id
        where a.poll_id = p_poll_id
        group by a.id;

        call p_GetPoll(p_poll_id);

    END $$
DELIMITER ;