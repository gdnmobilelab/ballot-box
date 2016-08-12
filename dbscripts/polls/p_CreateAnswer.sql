DELIMITER $$
    create procedure p_CreateAnswer(
        IN p_id VARCHAR(36),
        IN p_answer_name VARCHAR(350),
        IN p_poll_id VARCHAR(36)
    )

    BEGIN
        declare v_answer_exists_id VARCHAR(36);

        select id from poll_answers where id = p_id into v_answer_exists_id;

        IF v_answer_exists_id IS NOT NULL THEN
            update poll_answers set
                answer_name = p_answer_name,
                poll_id = p_poll_id
            where id = p_id;
        ELSE
            insert into poll_answers(id, answer_name, poll_id) values (p_id, p_answer_name, p_poll_id);
        END IF;

        select LAST_INSERT_ID() `id`;

    END $$
DELIMITER ;