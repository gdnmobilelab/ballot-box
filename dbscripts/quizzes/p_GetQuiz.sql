DELIMITER $$
    create procedure p_GetQuiz(
        IN p_id VARCHAR(36)
    )

    BEGIN

        select * from quizzes where id = p_id;

    END $$
DELIMITER ;