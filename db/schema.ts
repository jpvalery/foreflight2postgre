import { boolean, date, integer, numeric, pgTable, serial, time, varchar } from 'drizzle-orm/pg-core';

export const aircrafts = pgTable('aircrafts', {
	aircraftId: varchar('aircraft_id', { length: 20 }).primaryKey(),
	typeCode: varchar('type_code', { length: 10 }),
	year: integer('year'),
	make: varchar('make', { length: 50 }),
	model: varchar('model', { length: 50 }),
	gearType: varchar('gear_type', { length: 50 }),
	engineType: varchar('engine_type', { length: 50 }),
	equipType: varchar('equip_type', { length: 50 }),
	aircraftClass: varchar('aircraft_class', { length: 50 }),
	complexAircraft: boolean('complex_aircraft'),
	taa: boolean('taa'),
	highPerformance: boolean('high_performance'),
	pressurized: boolean('pressurized'),
});

export const flights = pgTable('flights', {
	id: serial('id').primaryKey(),

	// Core flight info
	flightDate: date('date'),
	aircraftId: varchar('aircraft_id', { length: 20 }).references(() => aircrafts.aircraftId),
	from: varchar('from', { length: 10 }),
	to: varchar('to', { length: 10 }),
	route: varchar('route', { length: 255 }),

	// Times
	timeOut: time('time_out'),
	timeOff: time('time_off'),
	timeOn: time('time_on'),
	timeIn: time('time_in'),
	onDuty: time('on_duty'),
	offDuty: time('off_duty'),

	// Durations (as numbers, hours.decimals)
	totalTime: numeric('total_time'),
	pic: numeric('pic'),
	sic: numeric('sic'),
	night: numeric('night'),
	solo: numeric('solo'),
	crossCountry: numeric('cross_country'),
	picus: numeric('picus'),
	multiPilot: numeric('multi_pilot'),
	ifr: numeric('ifr'),
	examiner: numeric('examiner'),
	nvg: numeric('nvg'),
	nvgOps: numeric('nvg_ops'),

	// Flight performance
	distance: numeric('distance'),
	actualInstrument: numeric('actual_instrument'),
	simulatedInstrument: numeric('simulated_instrument'),
	holds: integer('holds'),

	// Hobbs & Tach readings
	hobbsStart: numeric('hobbs_start'),
	hobbsEnd: numeric('hobbs_end'),
	tachStart: numeric('tach_start'),
	tachEnd: numeric('tach_end'),

	// Approaches
	approach1: varchar('approach_1', { length: 50 }),
	approach2: varchar('approach_2', { length: 50 }),
	approach3: varchar('approach_3', { length: 50 }),
	approach4: varchar('approach_4', { length: 50 }),
	approach5: varchar('approach_5', { length: 50 }),
	approach6: varchar('approach_6', { length: 50 }),

	// Instruction & training
	dualGiven: numeric('dual_given'),
	dualReceived: numeric('dual_received'),
	simulatedFlight: numeric('simulated_flight'),
	groundTraining: numeric('ground_training'),
	groundTrainingGiven: numeric('ground_training_given'),
	instructorName: varchar('instructor_name', { length: 100 }),
	instructorComments: varchar('instructor_comments', { length: 500 }),

	// People onboard or observers (free text)
	person1: varchar('person_1', { length: 255 }),
	person2: varchar('person_2', { length: 255 }),
	person3: varchar('person_3', { length: 255 }),
	person4: varchar('person_4', { length: 255 }),
	person5: varchar('person_5', { length: 255 }),
	person6: varchar('person_6', { length: 255 }),

	// Comments
	pilotComments: varchar('pilot_comments', { length: 500 }),
	remarks: varchar('remarks', { length: 500 }),

	// FAA-specific checkboxes
	flightReview: varchar('flight_review', { length: 10 }), // can be boolean if normalized
	ipc: varchar('ipc', { length: 10 }),
	checkride: varchar('checkride', { length: 10 }),
	faa6158: varchar('faa_61_58', { length: 10 }),
	nvgProficiency: varchar('nvg_proficiency', { length: 10 }),

	// Takeoffs and landings
	dayTakeoffs: integer('day_takeoffs'),
	dayLandingsFullStop: integer('day_landings_full_stop'),
	nightTakeoffs: integer('night_takeoffs'),
	nightLandingsFullStop: integer('night_landings_full_stop'),
	allLandings: integer('all_landings'),
});

