DELIMITER $$
    create procedure p_GetPollResponse(
        IN p_poll_id VARCHAR(36),
        IN p_response_type VARCHAR(15)
    )

    BEGIN
        declare v_response_type_id BIGINT;

        select id from notification_response_types where type = p_response_type into v_response_type_id;

        select id, response_title, response_body, response_on_tap,
                response_on_close, response_action_button_one_commands,
                response_action_button_one_text, response_action_button_one_icon,
                response_action_button_two_commands, response_action_button_two_text,
                response_action_button_two_icon, response_type
                from notification_responses nr where nr.poll_id = p_poll_id
                    and nr.response_type = v_response_type_id;

    END $$
DELIMITER ;