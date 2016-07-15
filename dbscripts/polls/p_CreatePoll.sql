DELIMITER $$
    create procedure p_CreatePoll(
        IN p_id VARCHAR(36),
        IN p_question VARCHAR(1000),
        IN p_icon VARCHAR(2500),
        IN p_is_closed BOOLEAN,
        IN p_tag VARCHAR(300),
        IN p_sns_topic VARCHAR(500),
        IN p_next_question_text VARCHAR(500),
        IN p_next_question_icon VARCHAR(2500)
    )

    BEGIN

        insert into polls(
            id,
            question,
            icon,
            is_closed,
            tag,
            sns_topic,
            next_question_text,
            next_question_icon
        )
        values (
            p_id,
            p_question,
            p_icon,
            p_is_closed,
            p_tag,
            p_sns_topic,
            p_next_question_text,
            p_next_question_icon
        );

        select p_id `id`;

    END $$
DELIMITER ;