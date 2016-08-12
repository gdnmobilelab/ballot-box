DELIMITER $$
    create procedure p_CreateQuiz(
        IN p_id VARCHAR(36),
        IN p_title VARCHAR(500),
        IN p_description VARCHAR(1000),
        IN p_icon VARCHAR(2500),
        IN p_is_closed BOOLEAN,
        IN p_tag VARCHAR(300),
        IN p_sns_topic VARCHAR(500),
        IN p_on_tap JSON,
        IN p_quiz_url VARCHAR(2500),
        IN p_social_title VARCHAR(500)
    )

    BEGIN
        declare v_quiz_exists_id VARCHAR(36);

        select id from quizzes where id = p_id into v_quiz_exists_id;

        IF v_quiz_exists_id IS NOT NULL THEN
            update quizzes set
                title = p_title,
                description = p_description,
                icon = p_icon,
                is_closed = p_is_closed,
                tag = p_tag,
                sns_topic = p_sns_topic,
                on_tap = p_on_tap,
                quiz_url = p_quiz_url,
                social_title = p_social_title
            where id = p_id;
        ELSE
            insert into quizzes(
                id,
                title,
                description,
                icon,
                is_closed,
                tag,
                sns_topic,
                on_tap,
                quiz_url,
                social_title
            )
            values (
                p_id,
                p_title,
                p_description,
                p_icon,
                p_is_closed,
                p_tag,
                p_sns_topic,
                p_on_tap,
                p_quiz_url,
                p_social_title
            );
        END IF;

        select p_id `id`;

    END $$
DELIMITER ;