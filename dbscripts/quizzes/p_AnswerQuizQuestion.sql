DELIMITER $$
    create procedure p_AnswerQuizQuestion(
        IN p_quiz_question_id VARCHAR(36),
        IN p_answer_id VARCHAR(36),
        IN p_user_id VARCHAR(255),
        IN p_user_subscription JSON
    )

    BEGIN
        declare v_user_exists BIGINT;
        declare v_user_id BIGINT;
        declare v_quiz_closed BOOLEAN;
        declare v_quiz_id VARCHAR(36);

        select id from users where user_id = p_user_id into v_user_exists;

        IF v_user_exists IS NULL THEN
            call p_CreateUser(p_user_id, p_user_subscription, @user_id);
            select @user_id into v_user_id;
        ELSE
            select v_user_exists into v_user_id;
        END IF;

        select quiz_id from quiz_questions qq where qq.id = p_quiz_question_id into v_quiz_id;

        select is_closed from quizzes q where q.id = v_quiz_id into v_quiz_closed;

        IF v_quiz_closed IS NOT TRUE THEN
            insert into quiz_users_answers(user_id, answer_id, quiz_question_id) values (v_user_id, p_answer_id, p_quiz_question_id);
        END IF;

    END $$
DELIMITER ;