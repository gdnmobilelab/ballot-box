DELIMITER $$
    create procedure p_LockPollThreshold(
        IN p_threshold INT,
        IN p_poll_id VARCHAR(36)
    )

    BEGIN
        declare v_already_locked_on TIMESTAMP;

        -- select the next threshold
        select min(threshold_locked_on) from poll_thresholds pt
            where pt.threshold > p_threshold
            and pt.poll_id = p_poll_id
            LIMIT 1 into v_already_locked_on;


        -- lock the threshold
        update poll_thresholds pt
            set threshold_locked_on = NOW()
            where pt.threshold = p_threshold and pt.poll_id = p_poll_id;

        -- was the next threshold already locked?
        IF v_already_locked_on THEN
            select true `was_already_locked`;
        ELSE
            select false `was_already_locked`;

        END IF;

    END $$
DELIMITER ;