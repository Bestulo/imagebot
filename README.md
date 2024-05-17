### Prerequisites

What things you need to install the software and how to install them:

- Deno: Follow the [installation guide](https://deno.land/#installation) on the official Deno website.

### Running the Project

To run the project, use the following command:

```
deno task prod
```

### Running with PM2

If you want to run the project with PM2, use the following command:

```
pm2 start --interpreter="deno" --name="imagebot" task prod
```
