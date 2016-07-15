DELIMITER $$
    create procedure p_GetQuizQuestionsAndAnswers(
        IN p_id VARCHAR(36)
    )

    BEGIN

        call p_GetQuiz(p_id);

        -- Get's the quiz questions
        select * from quiz_questions where quiz_id = p_id;

        -- Get's the quiz answers
        select * from quiz_answers qa
        join quiz_questions qq on qq.id = qa.quiz_question_id;


    END $$
DELIMITER ;