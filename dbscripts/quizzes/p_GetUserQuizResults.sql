DELIMITER $$
    create procedure p_GetUserQuizResults(
        IN p_user_id VARCHAR(2500),
        IN p_quiz_id VARCHAR(36)
    )

    BEGIN
        declare v_user_id BIGINT;

        select id from users u where u.user_id = p_user_id into v_user_id;

        -- Return the quiz
        select * from quizzes where id = p_quiz_id;

        -- Return the quiz questions
        select * from quiz_questions where quiz_id = p_quiz_id;

        -- Return the user's results
        select * from quiz_users_answers qua
        join quiz_answers qa on qua.answer_id = qa.id
        where qua.user_id = v_user_id;

        create temporary table total_correct_answers (
            correct_count BIGINT
        );

        insert into total_correct_answers (correct_count)
            select sum(qa.correct_answer) as total_correct
                FROM ballotbox.quiz_users_answers qua
                join quiz_answers qa on qua.answer_id = qa.id
                where qa.correct_answer = true
                group by qua.user_id;

        select total_correct, count(total) from total_correct_answers;

        drop table total_correct_answers;

    END $$
DELIMITER ;