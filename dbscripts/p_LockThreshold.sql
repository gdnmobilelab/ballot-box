DELIMITER $$
    create procedure p_LockThreshold(
        IN p_id INT
    )

    BEGIN
        declare v_threshold INT;
        declare v_already_locked_on TIMESTAMP;

        -- select the threshold
        select threshold from poll_thresholds where id = p_id into v_threshold;

        -- select the next threshold
        select min(threshold_locked_on) from poll_thresholds where threshold > v_threshold LIMIT 1 into v_already_locked_on;


        -- lock the threshold
        update poll_thresholds pt
            set threshold_locked_on = NOW()
            where pt.id = p_id;

        -- was the next threshold already locked?
        IF v_already_locked_on THEN
                select true `was_already_locked`;
        ELSE
            select false `was_already_locked`;

        END IF;

    END $$
DELIMITER ;