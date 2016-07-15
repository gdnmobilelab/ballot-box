DELIMITER $$
    create procedure p_LockQuizThreshold(
        IN p_threshold INT,
        IN p_quiz_id VARCHAR(36)
    )

    BEGIN
        declare v_already_locked_on TIMESTAMP;

        -- select the next threshold
        select min(threshold_locked_on) from quiz_thresholds qt
            where qt.threshold > p_threshold
            and qt.quiz_id = p_quiz_id
            LIMIT 1 into v_already_locked_on;


        -- lock the threshold
        update quiz_thresholds qt
            set threshold_locked_on = NOW()
            where qt.threshold = p_threshold and qt.quiz_id = p_quiz_id;

        -- was the next threshold already locked?
        IF v_already_locked_on THEN
            select true `was_already_locked`;
        ELSE
            select false `was_already_locked`;

        END IF;

    END $$
DELIMITER ;