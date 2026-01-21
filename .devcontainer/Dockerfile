FROM oven/bun:1-debian

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    git bash build-essential python3 pkg-config sqlite3 \
  && rm -rf /var/lib/apt/lists/*

# Create/reuse user safely
RUN set -eux; \
    if ! getent group "${USERNAME}" >/dev/null; then \
      groupadd "${USERNAME}"; \
    fi; \
    if ! id -u "${USERNAME}" >/dev/null 2>&1; then \
      useradd -m -s /bin/bash -g "${USERNAME}" "${USERNAME}"; \
    fi

WORKDIR /workspaces
USER ${USERNAME}
