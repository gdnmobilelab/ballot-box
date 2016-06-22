DELIMITER $$
    create procedure p_GetPoll(
        IN p_id BIGINT
    )

    BEGIN

        select * from polls where id = p_id;

    END $$
DELIMITER ;