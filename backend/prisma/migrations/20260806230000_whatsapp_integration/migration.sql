-- CreateTable
CREATE TABLE "whatsapp_integrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "encryptedAccessToken" TEXT NOT NULL,
    "verifyToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "lastSync" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "whatsapp_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "whatsapp_sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_sources_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "whatsapp_integrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "integrationId" TEXT NOT NULL,
    "sourceId" TEXT,
    "sender" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "receivedAt" DATETIME NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "parseStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "confidence" REAL NOT NULL DEFAULT 0,
    "rawPayload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whatsapp_messages_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "whatsapp_integrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "whatsapp_messages_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "whatsapp_sources" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "processing_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "executionTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "processing_logs_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "whatsapp_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_messages_integrationId_messageId_key" ON "whatsapp_messages"("integrationId", "messageId");

-- CreateIndex
CREATE INDEX "whatsapp_messages_receivedAt_idx" ON "whatsapp_messages"("receivedAt");

-- CreateIndex
CREATE INDEX "processing_logs_messageId_createdAt_idx" ON "processing_logs"("messageId", "createdAt");
