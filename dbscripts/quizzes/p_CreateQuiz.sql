DELIMITER $$
    create procedure p_CreateQuiz(
        IN p_id VARCHAR(36),
        IN p_title VARCHAR(500),
        IN p_description VARCHAR(1000),
        IN p_icon VARCHAR(2500),
        IN p_is_closed BOOLEAN,
        IN p_tag VARCHAR(300),
        IN p_sns_topic VARCHAR(500)
    )

    BEGIN

        insert into quizzes(
            id,
            title,
            description,
            icon,
            is_closed,
            tag,
            sns_topic
        )
        values (
            p_id,
            p_title,
            p_description,
            p_icon,
            p_is_closed,
            p_tag,
            p_sns_topic
        );

        select p_id `id`;

    END $$
DELIMITER ;