# CLI

For example, this can be used to monitor logs in real-time, create alarms, archive log data, etc.

Logs events are arranged as:
```
log groups ---> log streams ---> log events
```

```
# show all accessible log groups on account
aws logs describe-log-groups

# show log streams for a log group
aws logs describe-log-streams --log-group-name insertGroupNameHere

# get log events for a log stream
aws logs get-log-events --log-group-name insertGroupName --log-stream-name insertStreamName

aws logs describe metric-filters ...
aws logs filter-log-events ...
```

Can create a single command to get log events for a Lambda function:
```
logGroupName=/aws/lambda/MyFunction
logStreams = $(aws logs describe-log-streams        \
    --log-group-name ${logGroupName}                \
    --output text                                   \
    --query 'logStreams[*].logStreamName            \
) && for logStream in $logStreams; do               \
    aws logs get-log-events                         \
        --log-group-name ${logGroupName}            \
        --log-stream-name ${logStream}              \
        --output text                               \
        --query 'events[*].message';                \
done 
```