import { db } from '@/db';
import { aircrafts, flights } from '@/db/schema';
import { type NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

// Types
type AircraftRow = {
	AircraftID: string;
	TypeCode: string;
	Year: string;
	Make: string;
	Model: string;
	GearType: string;
	EngineType: string;
	'equipType (FAA)': string;
	'aircraftClass (FAA)': string;
	'complexAircraft (FAA)': string;
	'taa (FAA)': string;
	'highPerformance (FAA)': string;
	'pressurized (FAA)': string;
};

type FlightRow = {
	Date: string;
	AircraftID: string;
	From: string;
	To: string;
	Route: string | null;
	TimeOut?: string | null;
	TimeOff?: string | null;
	TimeOn?: string | null;
	TimeIn?: string | null;
	OnDuty?: string | null;
	OffDuty?: string | null;

	TotalTime?: number | null;
	PIC?: number | null;
	SIC?: number | null;
	Night?: number | null;
	Solo?: number | null;
	CrossCountry?: number | null;
	PICUS?: number | null;
	MultiPilot?: number | null;
	IFR?: number | null;
	Examiner?: number | null;
	NVG?: number | null;
	'NVG Ops'?: number | null;

	Distance?: number | null;
	ActualInstrument?: number | null;
	SimulatedInstrument?: number | null;

	Holds?: number | null;

	HobbsStart?: number | null;
	HobbsEnd?: number | null;
	TachStart?: number | null;
	TachEnd?: number | null;

	Approach1?: string | null;
	Approach2?: string | null;
	Approach3?: string | null;
	Approach4?: string | null;
	Approach5?: string | null;
	Approach6?: string | null;

	DualGiven?: number | null;
	DualReceived?: number | null;
	SimulatedFlight?: number | null;
	GroundTraining?: number | null;
	GroundTrainingGiven?: number | null;

	InstructorName?: string | null;
	InstructorComments?: string | null;

	Person1?: string | null;
	Person2?: string | null;
	Person3?: string | null;
	Person4?: string | null;
	Person5?: string | null;
	Person6?: string | null;

	Remarks?: string | null

	PilotComments?: string | null;

	'Flight Review (FAA)'?: string | null;
	'IPC (FAA)'?: string | null;
	'Checkride (FAA)'?: string | null;
	'FAA 61.58 (FAA)'?: string | null;
	'NVG Proficiency (FAA)'?: string | null;

	DayTakeoffs?: number | null;
	DayLandingsFullStop?: number | null;
	NightTakeoffs?: number | null;
	NightLandingsFullStop?: number | null;
	AllLandings?: number | null;
};

// Main handler
export async function POST(req: NextRequest) {
	console.log("Starting processing of CSV")
	try {
		const text = await req.text();
		const sections = text.split(',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,');

		if (sections.length < 4) throw new Error('Invalid CSV structure');

		const aircraftRaw = sections[2]
		.slice(2)
		.slice(0,-2)
		.split('\n')
		.map(line => line.replace(/,+\s*$/, ''))
		.join('\n');
		
		const flightsRaw = sections[4].replace(/^\r?\n/, '').replace(/\r?\n$/, '');

		const aircraftDataParsed = Papa.parse(aircraftRaw, {header: true})
		const aircraftData = aircraftDataParsed.data

		const flightDataParsed = Papa.parse(flightsRaw, { header: true })
		
		const flightData = flightDataParsed.data

		await db.transaction(async (tx) => {
			const typedAircraftData = aircraftData as AircraftRow[];
			for (const row of typedAircraftData) {
				await tx.insert(aircrafts).values({
					aircraftId: row.AircraftID,
					typeCode: row.TypeCode,
					year: row.Year ? Number.parseInt(row.Year) : null,
					make: row.Make,
					model: row.Model,
					gearType: row.GearType,
					engineType: row.EngineType,
					equipType: row['equipType (FAA)'],
					aircraftClass: row['aircraftClass (FAA)'],
					complexAircraft: normalizeBool(row['complexAircraft (FAA)']),
					taa: normalizeBool(row['taa (FAA)']),
					highPerformance: normalizeBool(row['highPerformance (FAA)']),
					pressurized: normalizeBool(row['pressurized (FAA)']),
				}).onConflictDoUpdate({
					target: aircrafts.aircraftId,
					set: {
						make: row.Make,
						model: row.Model,
						year: row.Year ? Number.parseInt(row.Year) : null,
					},
				});
			}

			const typedFlightData = flightData as FlightRow[];
			for (const row of typedFlightData) {	
				const flight = flightRow(row);
				await tx.insert(flights).values(flight);
				 
			}
			
		});

		return NextResponse.json({ success: true });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
	}
}

// Helpers functions
const normalizeBool = (value: string) => value?.toLowerCase() === 'true';

// biome-ignore lint/suspicious/noExplicitAny: "fuck ts"
function flightRow(row: any): any {
	return {
		flightDate: row.Date || null,
		aircraftId: row.AircraftID || null,
		from: row.From || null,
		to: row.To || null,
		route: row.Route || null,

		timeOut: emptyToNull(row.TimeOut),
		timeOff: emptyToNull(row.TimeOff),
		timeOn: emptyToNull(row.TimeOn),
		timeIn: emptyToNull(row.TimeIn),
		onDuty: emptyToNull(row.OnDuty),
		offDuty: emptyToNull(row.OffDuty),

		totalTime: parseNum(row.TotalTime),
		pic: parseNum(row.PIC),
		sic: parseNum(row.SIC),
		night: parseNum(row.Night),
		solo: parseNum(row.Solo),
		crossCountry: parseNum(row.CrossCountry),
		picus: parseNum(row.PICUS),
		multiPilot: parseNum(row.MultiPilot),
		ifr: parseNum(row.IFR),
		examiner: parseNum(row.Examiner),
		nvg: parseNum(row.NVG),
		nvgOps: parseNum(row['NVG Ops']),

		distance: parseNum(row.Distance),
		actualInstrument: parseNum(row.ActualInstrument),
		simulatedInstrument: parseNum(row.SimulatedInstrument),
		holds: parseIntOrNull(row.Holds),

		hobbsStart: parseNum(row.HobbsStart),
		hobbsEnd: parseNum(row.HobbsEnd),
		tachStart: parseNum(row.TachStart),
		tachEnd: parseNum(row.TachEnd),

		approach1: emptyToNull(row.Approach1),
		approach2: emptyToNull(row.Approach2),
		approach3: emptyToNull(row.Approach3),
		approach4: emptyToNull(row.Approach4),
		approach5: emptyToNull(row.Approach5),
		approach6: emptyToNull(row.Approach6),

		dualGiven: parseNum(row.DualGiven),
		dualReceived: parseNum(row.DualReceived),
		simulatedFlight: parseNum(row.SimulatedFlight),
		groundTraining: parseNum(row.GroundTraining),
		groundTrainingGiven: parseNum(row.GroundTrainingGiven),
		instructorName: emptyToNull(row.InstructorName),
		instructorComments: emptyToNull(row.InstructorComments),

		person1: emptyToNull(row.Person1),
		person2: emptyToNull(row.Person2),
		person3: emptyToNull(row.Person3),
		person4: emptyToNull(row.Person4),
		person5: emptyToNull(row.Person5),
		person6: emptyToNull(row.Person6),

		pilotComments: emptyToNull(row.PilotComments),
		remarks: null,

		flightReview: emptyToNull(row['Flight Review (FAA)']),
		ipc: emptyToNull(row['IPC (FAA)']),
		checkride: emptyToNull(row['Checkride (FAA)']),
		faa6158: emptyToNull(row['FAA 61.58 (FAA)']),
		nvgProficiency: emptyToNull(row['NVG Proficiency (FAA)']),

		dayTakeoffs: parseIntOrNull(row.DayTakeoffs),
		dayLandingsFullStop: parseIntOrNull(row.DayLandingsFullStop),
		nightTakeoffs: parseIntOrNull(row.NightTakeoffs),
		nightLandingsFullStop: parseIntOrNull(row.NightLandingsFullStop),
		allLandings: parseIntOrNull(row.AllLandings),
	};
}

function parseNum(value: string): number | null {
	const n = Number.parseFloat(value);
	return Number.isNaN(n) ? null : n;
}

function parseIntOrNull(value: string): number | null {
	const n = Number.parseInt(value, 10);
	return Number.isNaN(n) ? null : n;
}

function emptyToNull(value: string): string | null {
	return value?.trim() ? value : null;
}