DELIMITER $$
    create procedure p_CreateAnswer(
        IN p_id BIGINT,
        IN p_answer_name VARCHAR(350),
        IN p_poll_id BIGINT
    )

    BEGIN

        IF p_id
        THEN
            update answers
            set
                answer_name = p_answer_name,
                poll_id     = p_poll_id
            where id = p_id;

            select p_id `id`;
        ELSE
            insert into answers(answer_name, poll_id) values (p_answer_name, p_poll_id);
            select LAST_INSERT_ID() `id`;
        END IF;

    END $$
DELIMITER ;