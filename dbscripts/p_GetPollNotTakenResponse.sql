DELIMITER $$
    create procedure p_GetPollUpdateResponse(
        IN p_poll_id VARCHAR(36)
    )

    BEGIN
       call p_GetPoll(p_poll_id); -- Return the poll
       call p_GetPollResults(p_poll_id); -- Return the results
       call p_GetPollResponse(p_poll_id, 'POLL_SKIPPED');

    END $$
DELIMITER ;