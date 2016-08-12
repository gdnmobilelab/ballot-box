DELIMITER $$
    create procedure p_CreateQuizResponse(
        IN p_quiz_id VARCHAR(36),
        IN p_number_answered_correctly INT,
        IN p_response_title VARCHAR(250),
        IN p_response_body VARCHAR(500)
    )

    BEGIN
        declare v_quiz_response_exists_quiz_id VARCHAR(36);

        select quiz_id from quiz_result_responses where quiz_id = p_quiz_id and number_answered_correctly = p_number_answered_correctly;

        IF v_quiz_response_exists_quiz_id IS NOT NULL THEN
            update quiz_result_responses set
                response = p_response
            where quiz_id = p_quiz_id
            and number_answered_correctly = p_number_answered_correctly;
        ELSE
            insert into quiz_result_responses(
                quiz_id,
                number_answered_correctly,
                response_title,
                response_body
            )
            values (
                p_quiz_id,
                p_number_answered_correctly,
                p_response_title,
                p_response_body
            );
        END IF;

        select p_quiz_id `quiz_id`, p_number_answered_correctly `number_answered_correctly`;

    END $$
DELIMITER ;