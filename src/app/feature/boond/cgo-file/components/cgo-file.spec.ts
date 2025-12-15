import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CgoFile } from './cgo-file';
import { signal } from '@angular/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTabGroupHarness } from '@angular/material/tabs/testing';
import { CgoFileStore } from '../stores/cgo-file.store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({ selector: 'app-ressources-table', template: '', standalone: true })
class MockRessourcesTableComponent {}

@Component({ selector: 'app-cra-table', template: '', standalone: true })
class MockCraTableComponent {}

@Component({ selector: 'app-notes-frais-table', template: '', standalone: true })
class MockNotesFraisTableComponent {}

@Component({ selector: 'app-cgo-file-form', template: '<div>Mock Form</div>', standalone: true })
class MockCgoFileFormComponent {}

const mockCgoFileStore = {
  isLoading: signal(false),
  isSuccess: signal(false),
  error: signal(null),
  ressources: signal([]),
  cra: signal([]),
  notesDeFrais: signal([]),
  progress: signal(0),
  lastRequest: signal(null),
  agencyLabel: signal('N/A'),
  generateAndPoll: jest.fn(),
  checkAndPollExistingJob: jest.fn(),
};

describe('CgoFile', () => {
  let component: CgoFile;
  let fixture: ComponentFixture<CgoFile>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CgoFile,
        NoopAnimationsModule,
        MockCgoFileFormComponent,
        MockRessourcesTableComponent,
        MockCraTableComponent,
        MockNotesFraisTableComponent,
      ],
      providers: [
        { provide: CgoFileStore, useValue: mockCgoFileStore },
        provideMomentDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CgoFile);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the CgoFileForm component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-cgo-file-form')).toBeTruthy();
  });

  it('should display the first tab content (Ressources) by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-ressources-table')).toBeTruthy();
    expect(compiled.querySelector('app-cra-table')).toBeNull();
    expect(compiled.querySelector('app-notes-frais-table')).toBeNull();
  });

  it('should load tab content lazily when a tab is selected', async () => {
    const tabGroup = await loader.getHarness(MatTabGroupHarness);

    await tabGroup.selectTab({ label: 'event_noteCRA' });
    await fixture.whenStable();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-cra-table')).toBeTruthy();

    await tabGroup.selectTab({ label: 'receiptNote de frais' });
    await fixture.whenStable();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-notes-frais-table')).toBeTruthy();
  });

  it('should render the tab group with three tabs', async () => {
    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    const tabs = await tabGroup.getTabs();
    expect(tabs.length).toBe(3);

    expect(await tabs[0].getLabel()).toContain('Ressources');
    expect(await tabs[1].getLabel()).toContain('CRA');
    expect(await tabs[2].getLabel()).toContain('Note de frais');
  });
});
