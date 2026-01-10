---
applyTo: '**/*.{js,ts}'
---

# Winston Logging Instructions

Use structured logging with Winston: pass a static message string and an object with parameters instead of concatenating values.

## Pattern

```javascript
logger.info('User logged in', { userId: 123, username: 'john_doe' });
```

Avoid:

```javascript
logger.info(`User ${username} logged in`);
```

## Benefits

- Better searchability and analysis
- Improved performance
- Consistent log formats

## Best Practices

- Use descriptive static messages
- Include relevant context in objects
- Avoid sensitive data in logs

