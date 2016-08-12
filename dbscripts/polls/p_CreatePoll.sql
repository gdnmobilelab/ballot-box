DELIMITER $$
    create procedure p_CreatePoll(
        IN p_id VARCHAR(36),
        IN p_title VARCHAR(500),
        IN p_question VARCHAR(1000),
        IN p_icon VARCHAR(2500),
        IN p_is_closed BOOLEAN,
        IN p_tag VARCHAR(300),
        IN p_sns_topic VARCHAR(500),
        IN p_next_question_text VARCHAR(500),
        IN p_next_question_icon VARCHAR(2500),
        IN p_on_tap JSON
    )

    BEGIN
        declare v_poll_exists_id VARCHAR(36);

        select id from polls where id = p_id into v_poll_exists_id;

        IF v_poll_exists_id IS NOT NULL THEN
            update polls set
                title = p_title,
                question = p_question,
                icon = p_icon,
                is_closed = p_is_closed,
                tag = p_tag,
                sns_topic = p_sns_topic,
                next_question_text = p_next_question_text,
                next_question_icon = p_next_question_icon,
                on_tap = p_on_tap
            where id = p_id;
        ELSE
            insert into polls(
                id,
                title,
                question,
                icon,
                is_closed,
                tag,
                sns_topic,
                next_question_text,
                next_question_icon,
                on_tap
            )
            values (
                p_id,
                p_title,
                p_question,
                p_icon,
                p_is_closed,
                p_tag,
                p_sns_topic,
                p_next_question_text,
                p_next_question_icon,
                p_on_tap
            );
        END IF;

        select p_id `id`;

    END $$
DELIMITER ;