DELIMITER $$
    create procedure p_GetPoll(
        IN p_id VARCHAR(36)
    )

    BEGIN

        select * from polls where id = p_id;

    END $$
DELIMITER ;