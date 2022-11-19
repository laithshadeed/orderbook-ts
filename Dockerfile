FROM denoland/deno:1.27.2

WORKDIR /app

USER deno

ADD src/ .

CMD ["run", "--allow-net", "--allow-env", "main.ts"]
