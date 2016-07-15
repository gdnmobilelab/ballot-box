DELIMITER $$
    create procedure p_CreateQuizQuestion(
        IN p_id VARCHAR(36),
        IN p_question VARCHAR(1500),
        IN p_quiz_id VARCHAR(36)
    )

    BEGIN

        insert into quiz_questions(
            id,
            question,
            quiz_id
        )
        values (
            p_id,
            p_question,
            p_quiz_id
        );

        select p_id `id`;

    END $$
DELIMITER ;