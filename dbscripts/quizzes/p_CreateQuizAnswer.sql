DELIMITER $$
    create procedure p_CreateQuizAnswer(
        IN p_id VARCHAR(36),
        IN p_answer_name VARCHAR(350),
		IN p_correct_answer BOOLEAN,
        IN p_quiz_question_id VARCHAR(36)
    )

    BEGIN

        insert into quiz_answers(
            id,
            answer_name,
            correct_answer,
            quiz_question_id
        )
        values (
            p_id,
            p_answer_name,
            p_correct_answer,
            p_quiz_question_id
        );

        select p_id `id`;

    END $$
DELIMITER ;