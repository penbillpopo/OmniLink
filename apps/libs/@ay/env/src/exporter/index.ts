import { ConfigMapExporter } from './config-map-exporter';
import { JsonExporter } from './json-exporter';
import { MarkdownExporter } from './markdown-exporter';

export class EnvironmentExporter {
  public static json(filepath: string, service: string) {
    const exporter = new JsonExporter(filepath, service);
    exporter.export();
  }

  public static md(filepath: string) {
    const exporter = new MarkdownExporter();
    exporter.export(filepath);
  }

  public static configMap(filepath: string, name: string, namespace: string) {
    const exporter = new ConfigMapExporter();
    exporter.export(filepath, name, namespace);
  }
}
