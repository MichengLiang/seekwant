import { resolve } from "node:path";

export type DatasetMode = "single-file" | "book-entry";

type BaseDataset = {
  id: string;
  label: string;
  outputPath: string;
  sourcePath: string;
};

export type SingleFileDataset = BaseDataset & {
  mode: "single-file";
};

export type BookEntryDataset = BaseDataset & {
  mode: "book-entry";
  documentRoot: string;
};

export type Dataset = SingleFileDataset | BookEntryDataset;

const ROOT = resolve(import.meta.dirname, "..");

function pathFromRoot(path: string): string {
  return resolve(ROOT, path);
}

export const DATASETS: Dataset[] = [
  {
    id: "red-chamber",
    label: "红楼梦人物关系",
    mode: "single-file",
    sourcePath: pathFromRoot(
      "fixtures/source-documents/red-chamber/document.adoc",
    ),
    outputPath: "public/data/red-chamber.ttl",
  },
  {
    id: "tcm-diagnosis",
    label: "中医辨证论治",
    mode: "single-file",
    sourcePath: pathFromRoot(
      "fixtures/source-documents/tcm-diagnosis/document.adoc",
    ),
    outputPath: "public/data/tcm-diagnosis.ttl",
  },
  {
    id: "wwii-causal",
    label: "二战因果链",
    mode: "single-file",
    sourcePath: pathFromRoot(
      "fixtures/source-documents/wwii-causal/document.adoc",
    ),
    outputPath: "public/data/wwii-causal.ttl",
  },
  {
    id: "service-dependency",
    label: "微服务依赖",
    mode: "single-file",
    sourcePath: pathFromRoot(
      "fixtures/source-documents/service-dependency/document.adoc",
    ),
    outputPath: "public/data/service-dependency.ttl",
  },
  {
    id: "book-entry-demo",
    label: "Book Entry",
    mode: "book-entry",
    sourcePath: pathFromRoot(
      "fixtures/source-documents/book-entry-demo/book.adoc",
    ),
    documentRoot: pathFromRoot("fixtures/source-documents/book-entry-demo"),
    outputPath: "public/data/book-entry-demo.ttl",
  },
  {
    id: "book-anatomy",
    label: "Book Anatomy",
    mode: "book-entry",
    sourcePath: pathFromRoot(
      "fixtures/source-documents/book-anatomy/books/00-book-anatomy/book.adoc",
    ),
    documentRoot: pathFromRoot("fixtures/source-documents/book-anatomy"),
    outputPath: "public/data/book-anatomy.ttl",
  },
];
