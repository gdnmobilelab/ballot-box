DELIMITER $$
    create procedure p_CreatePoll(
        IN p_id BIGINT,
        IN p_poll_title VARCHAR(350),
        IN p_poll_question VARCHAR(100),
        IN p_poll_is_closed BOOLEAN,
        IN p_poll_sns_topic VARCHAR(500),
        IN p_poll_taken_response JSON,
        IN p_poll_not_taken_response JSON
    )

    BEGIN

        IF p_id
        THEN
            update polls
            set
                poll_title              = p_poll_title,
                poll_question           = p_poll_question,
                poll_is_closed          = p_poll_is_closed,
                poll_sns_topic          = p_poll_sns_topic,
                poll_taken_response     = p_poll_taken_response,
                poll_not_taken_response = p_poll_taken_response
            where id = p_id;

            select p_id `id`;
        ELSE
            insert into polls(poll_title, poll_question, poll_is_closed,
                                poll_sns_topic, poll_taken_response, poll_not_taken_response)
                values (p_poll_title, p_poll_question, p_poll_is_closed,
                        p_poll_sns_topic, p_poll_taken_response, p_poll_not_taken_response);

            select LAST_INSERT_ID() `id`;
        END IF;

    END $$
DELIMITER ;