DELIMITER $$
    create procedure p_LockThreshold(
        IN p_id INT
    )

    BEGIN

    update poll_thresholds pt
        set threshold_locked_on = NOW()
        where pt.id = p_id;

        select pt.threshold_locked_on from poll_thresholds pt
            where pt.id = p_id;

    END $$
DELIMITER ;