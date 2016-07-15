DELIMITER $$
    create procedure p_CreateQuizResponse(
        IN p_id VARCHAR(36),
        IN p_response_title VARCHAR(350),
        IN p_response_body VARCHAR(1000),
        IN p_response_on_tap JSON,
        IN p_response_on_close JSON,
        IN p_response_action_button_one_commands JSON,
        IN p_response_action_button_one_text VARCHAR(100),
        IN p_response_action_button_one_icon VARCHAR(250),
        IN p_response_action_button_two_commands JSON,
        IN p_response_action_button_two_text VARCHAR(100),
        IN p_response_action_button_two_icon VARCHAR(250),
        IN p_response_type VARCHAR(15),
        IN p_quiz_id VARCHAR(36)
    )

    BEGIN
        declare v_response_type_id BIGINT;

        select id from quiz_notification_response_types where type = p_response_type into v_response_type_id;

        insert into quiz_notification_responses (
            id,
            response_title,
            response_body,
            response_on_tap,
            response_on_close,
            response_action_button_one_commands,
            response_action_button_one_text,
            response_action_button_one_icon,
            response_action_button_two_commands,
            response_action_button_two_text,
            response_action_button_two_icon,
            response_type,
            quiz_id
        ) VALUES (
            p_id,
            p_response_title,
            p_response_body,
            p_response_on_tap,
            p_response_on_close,
            p_response_action_button_one_commands,
            p_response_action_button_one_text,
            p_response_action_button_one_icon,
            p_response_action_button_two_commands,
            p_response_action_button_two_text,
            p_response_action_button_two_icon,
            v_response_type_id,
            p_quiz_id
        );

    END $$
DELIMITER ;