-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TEXT NOT NULL,
    "gestion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "enlaceVideo" TEXT,
    "etiquetas" TEXT[],
    "detalles" JSONB,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivoAdjunto" (
    "id" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "pesoBytes" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,

    CONSTRAINT "ArchivoAdjunto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArchivoAdjunto" ADD CONSTRAINT "ArchivoAdjunto_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
