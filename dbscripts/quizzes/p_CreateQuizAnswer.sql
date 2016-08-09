DELIMITER $$
    create procedure p_CreateQuizAnswer(
        IN p_id VARCHAR(36),
        IN p_answer_name VARCHAR(350),
        IN p_answer_text VARCHAR(1000),
		IN p_correct_answer BOOLEAN,
        IN p_quiz_question_id VARCHAR(36)
    )

    BEGIN
        declare v_quiz_answer_exists_id VARCHAR(36);

        select id from quiz_answers where id = p_id into v_quiz_answer_exists_id;

        IF v_quiz_answer_exists_id IS NOT NULL THEN
            update quiz_answers set
                answer_name = p_answer_name,
                answer_text = p_answer_text,
                correct_answer = p_correct_answer,
                quiz_question_id = p_quiz_question_id
            where id = p_id;
        ELSE
            insert into quiz_answers(
                id,
                answer_name,
                answer_text,
                correct_answer,
                quiz_question_id
            )
            values (
                p_id,
                p_answer_name,
                p_answer_text,
                p_correct_answer,
                p_quiz_question_id
            );
        END IF;

        select p_id `id`;

    END $$
DELIMITER ;