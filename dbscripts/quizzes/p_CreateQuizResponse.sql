DELIMITER $$
    create procedure p_CreateQuizResponse(
        IN p_quiz_id VARCHAR(36),
        IN p_number_answered_correctly INT,
        IN p_response_title VARCHAR(250),
        IN p_response_body VARCHAR(500),
        IN p_response_on_tap JSON,
        IN p_response_action_button_one_commands JSON,
        IN p_response_action_button_one_text VARCHAR(100),
        IN p_response_action_button_one_icon VARCHAR(2500),
        IN p_response_action_button_two_commands JSON,
        IN p_response_action_button_two_text VARCHAR(100),
        IN p_response_action_button_two_icon VARCHAR(2500)
    )

    BEGIN
        declare v_quiz_response_exists_quiz_id VARCHAR(36);

        select quiz_id from quiz_result_responses where quiz_id = p_quiz_id and number_answered_correctly = p_number_answered_correctly into v_quiz_response_exists_quiz_id;

        IF v_quiz_response_exists_quiz_id IS NOT NULL THEN
            update quiz_result_responses set
                response_body = p_response_body,
                response_title = p_response_title,
                response_on_tap = p_response_on_tap,
                response_action_button_one_commands = p_response_action_button_one_commands,
                response_action_button_one_text = p_response_action_button_one_text,
                response_action_button_one_icon = p_response_action_button_one_icon,
                response_action_button_two_commands = p_response_action_button_two_commands,
                response_action_button_two_text = p_response_action_button_two_text,
                response_action_button_two_icon = p_response_action_button_two_icon
            where quiz_id = p_quiz_id
            and number_answered_correctly = p_number_answered_correctly;
        ELSE
            insert into quiz_result_responses(
                quiz_id,
                number_answered_correctly,
                response_title,
                response_body,
                response_on_tap,
                response_action_button_one_commands,
                response_action_button_one_text,
                response_action_button_one_icon,
                response_action_button_two_commands,
                response_action_button_two_text,
                response_action_button_two_icon
            )
            values (
                p_quiz_id,
                p_number_answered_correctly,
                p_response_title,
                p_response_body,
                p_response_on_tap,
                p_response_action_button_one_commands,
                p_response_action_button_one_text,
                p_response_action_button_one_icon,
                p_response_action_button_two_commands,
                p_response_action_button_two_text,
                p_response_action_button_two_icon
            );
        END IF;

        select p_quiz_id `quiz_id`, p_number_answered_correctly `number_answered_correctly`;

    END $$
DELIMITER ;