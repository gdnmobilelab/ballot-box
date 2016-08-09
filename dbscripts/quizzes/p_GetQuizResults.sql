DELIMITER $$
    create procedure p_GetQuizResults(
        IN p_user_id VARCHAR(2500),
        IN p_quiz_id VARCHAR(36)
    )

    BEGIN
        declare v_user_id BIGINT;

        drop table if exists total_correct_answers;

        select id from users u where u.user_id = p_user_id into v_user_id;

        -- Return the quiz
        select * from quizzes where id = p_quiz_id;

        -- Return the quiz questions
        select * from quiz_questions qq
        where qq.quiz_id = p_quiz_id;

        -- Return the quiz answers
        select answer.* from quiz_answers answer
        join quiz_questions question on answer.quiz_question_id = question.id
        where question.quiz_id = p_quiz_id;

        select * from quiz_result_responses
            where quiz_id = p_quiz_id;

--        create temporary table total_correct_answers (
--            correct_count BIGINT
--        );
--
--        insert into total_correct_answers (correct_count)
--            select sum(qa.correct_answer) as total_correct
--                FROM quiz_users_answers qua
--                join quiz_answers qa on qua.answer_id = qa.id
--                join quiz_questions question on qa.quiz_question_id = question.id
--                where question.quiz_id = p_quiz_id
--                group by qua.user_id;
--
--        select correct_count, count(correct_count) `num_users` from total_correct_answers group by correct_count;

    END $$
DELIMITER ;