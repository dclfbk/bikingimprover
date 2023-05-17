import click
import importlib
import sys
from pathlib import Path
import traceback

import warnings
warnings.filterwarnings("ignore")


@click.command()
@click.argument('input_files', type=click.File('r'), nargs=-1)
@click.option('-s', '--settings', type=click.File('r'))
@click.option('-i', '--importer', default='bikingimprover.osm.OSMImporter')
def main(input_files, *args, settings, importer, **kwargs):
  ImporterClass = None
  try:
    components = importer.split('.')
    mod = importlib.import_module('.'.join(components[:-1]))
    ImporterClass = getattr(mod, components[-1])
  except Exception as e:
    click.echo(traceback.format_exc(), err=True)
    click.echo(f'Failed to load {importer}', err=True)
    sys.exit(-1)

  if len(input_files) == 0:
    click.echo('At least a file is required to proceed')
    sys.exit(-1)

  instance = ImporterClass(input_files, settings)
  instance.run_import()


if __name__ == '__main__':
  current_path = Path(__file__).parent.resolve()
  sys.path.append(str(current_path))
  main()
