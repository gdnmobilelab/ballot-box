DELIMITER $$
    create procedure p_CreatePollThreshold(
        IN p_threshold INT,
        IN p_poll_id VARCHAR(36)
    )

    BEGIN

    insert into poll_thresholds(threshold, poll_id)
        values (p_threshold, p_poll_id);

    select LAST_INSERT_ID() `id`;

    END $$
DELIMITER ;