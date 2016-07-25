DELIMITER $$
    create procedure p_CreateQuizQuestion(
        IN p_id VARCHAR(36),
        IN p_question VARCHAR(1500),
        IN p_quiz_id VARCHAR(36)
    )

    BEGIN
        declare v_quiz_question_exists_id VARCHAR(36);

        select id from quiz_questions where id = p_id into v_quiz_question_exists_id;

        IF v_quiz_question_exists_id IS NOT NULL THEN
            update quiz_questions set
                question = p_question,
                quiz_id = p_quiz_id
            where id = p_id;
        ELSE
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
        END IF;

        select p_id `id`;

    END $$
DELIMITER ;