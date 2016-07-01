DELIMITER $$
    create procedure p_CreateAnswer(
        IN p_answer_name VARCHAR(350),
        IN p_poll_id VARCHAR(36)
    )

    BEGIN

        insert into poll_answers(answer_name, poll_id) values (p_answer_name, p_poll_id);
        select LAST_INSERT_ID() `id`;

    END $$
DELIMITER ;