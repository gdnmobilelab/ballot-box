DELIMITER $$
    create procedure p_GetPollThresholds(
        IN p_poll_id BIGINT
    )

    BEGIN

        select * from poll_thresholds where poll_id = p_poll_id;

    END $$
DELIMITER ;